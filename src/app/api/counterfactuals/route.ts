import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

// Helper function for visible logging (updated to force recompilation)
const log = (message: string, data?: unknown) => {
	const timestamp = new Date().toISOString();
	const separator = '-'.repeat(60);
	process.stdout.write(`\n${separator}\n`);
	process.stdout.write(`[${timestamp}] ${message}\n`);
	if (data) {
		process.stdout.write('Data: ' + JSON.stringify(data, null, 2) + '\n');
	}
	process.stdout.write(`${separator}\n`);
};

// Helper to flatten nested objects with dot notation
function flattenObject(
	obj: Record<string, unknown>,
	prefix = '',
	res: Record<string, unknown> = {},
): Record<string, unknown> {
	for (const key in obj) {
		if (Object.prototype.hasOwnProperty.call(obj, key)) {
			const value = obj[key];
			const newKey = prefix ? `${prefix}.${key}` : key;
			if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
				flattenObject(value as Record<string, unknown>, newKey, res);
			} else {
				res[newKey] = value;
			}
		}
	}
	return res;
}

export async function POST(req: NextRequest) {
	try {
		log('Received counterfactuals API request');
		const body = await req.json();
		const { features, locked } = body as { features: Record<string, unknown>; locked: string[] };
		log('Processing request', { features, locked });

		// Map frontend purpose values to training data purpose values
		const purposeMapping: Record<string, string> = {
			car: 'car',
			'radio/TV': 'radio/TV',
			education: 'others',
			'furniture/equipment': 'furniture',
			business: 'others',
			'domestic appliances': 'others',
			repairs: 'others',
			'vacation/others': 'others',
		};

		// Apply purpose mapping if purpose exists in features
		const flatFeatures: Record<string, unknown> = flattenObject(features);
		if (flatFeatures.purpose && typeof flatFeatures.purpose === 'string') {
			const mappedPurpose = purposeMapping[flatFeatures.purpose];
			if (mappedPurpose) {
				flatFeatures.purpose = mappedPurpose;
				log('Mapped purpose value', { original: features.purpose, mapped: mappedPurpose });
			}
		}
		const csvColumns = [
			{ key: 'age', csv: 'Age' },
			{ key: 'sex', csv: 'Sex' },
			{ key: 'job', csv: 'Job' },
			{ key: 'housing', csv: 'Housing' },
			{ key: 'saving.accounts', csv: 'Saving accounts' },
			{ key: 'checking.account', csv: 'Checking account' },
			{ key: 'credit.amount', csv: 'Credit amount' },
			{ key: 'duration', csv: 'Duration' },
			{ key: 'purpose', csv: 'Purpose' },
		];

		log('Flat features to be written to CSV:', flatFeatures);
		const csvHeader = csvColumns.map((col) => col.csv).join(',');
		const csvRowArr = csvColumns.map((col) => {
			const value = flatFeatures[col.key];
			// If value is undefined, use empty string
			return value !== undefined ? value : '';
		});
		log('CSV row array:', csvRowArr);
		// Error checking: if any required field is missing or empty, throw error
		const missingFields = csvColumns
			.filter((col, idx) => csvRowArr[idx] === '' || csvRowArr[idx] === undefined)
			.map((col) => col.key);
		if (missingFields.length > 0) {
			log('Error: Missing required fields', missingFields);
			return NextResponse.json(
				{ success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
				{ status: 400 },
			);
		}
		const csvRow = csvRowArr.join(',');
		log('CSV header:', csvHeader);
		log('CSV row:', csvRow);
		const tempInputPath = path.join('/tmp', `input_${Date.now()}.csv`);
		fs.writeFileSync(tempInputPath, `${csvHeader}\n${csvRow}\n`);
		log('Created temporary input file', { path: tempInputPath });

		// Write locked features to a temp file
		const tempLockedPath = path.join('/tmp', `locked_${Date.now()}.txt`);
		fs.writeFileSync(tempLockedPath, locked.join(','));
		log('Created temporary locked features file', { path: tempLockedPath });

		// Call the R script with the input and locked files as arguments
		const rScriptPath = path.resolve('src/r-server/scripts/german_credit_application.R');
		const args = [rScriptPath, tempInputPath, tempLockedPath];
		log('Executing R script', { script: rScriptPath, args });

		const result = await new Promise((resolve, reject) => {
			const proc = spawn('Rscript', args);
			let stdout = '';
			let stderr = '';

			proc.stdout.on('data', (data) => {
				const output = data.toString();
				log('R script stdout', { output });
				stdout += output;
			});

			proc.stderr.on('data', (data) => {
				const error = data.toString();
				log('R script stderr', { error });
				stderr += error;
			});

			proc.on('close', (code) => {
				log('R script process exited', { code });
				if (code === 0) {
					resolve(stdout);
				} else {
					reject(stderr || 'R script failed');
				}
			});
		});

		// Clean up temp files
		fs.unlinkSync(tempInputPath);
		fs.unlinkSync(tempLockedPath);
		log('Cleaned up temporary files');

		// After successful counterfactual generation, run the UMAP pipeline
		log('Starting UMAP data generation pipeline');
		try {
			const pythonScriptPath = path.resolve('src/python-server/run_umap_pipeline.py');
			const pythonResult = await new Promise((resolve, reject) => {
				const pythonProc = spawn('python3', [pythonScriptPath]);
				let pythonStdout = '';
				let pythonStderr = '';

				pythonProc.stdout.on('data', (data) => {
					const output = data.toString();
					log('Python pipeline stdout', { output });
					pythonStdout += output;
				});

				pythonProc.stderr.on('data', (data) => {
					const error = data.toString();
					log('Python pipeline stderr', { error });
					pythonStderr += error;
				});

				pythonProc.on('close', (code) => {
					log('Python pipeline process exited', { code });
					if (code === 0) {
						resolve(pythonStdout);
					} else {
						reject(pythonStderr || 'Python pipeline failed');
					}
				});
			});

			log('UMAP pipeline completed successfully', { pythonResult });
		} catch (pythonError) {
			log('Warning: UMAP pipeline failed, but counterfactuals were generated successfully', {
				error: pythonError?.toString(),
			});
			// Don't fail the entire request if UMAP generation fails
		}

		log('Counterfactuals generation completed successfully', { result });
		return NextResponse.json({ success: true, result });
	} catch (error) {
		log('Error in counterfactuals API', { error: error?.toString() });
		return NextResponse.json({ success: false, error: error?.toString() });
	}
}
