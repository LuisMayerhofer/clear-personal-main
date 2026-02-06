import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
	baseDirectory: __dirname,
});

const eslintConfig = [
	...compat.extends('next/core-web-vitals', 'next/typescript', 'plugin:prettier/recommended'),
	{
		rules: {
			'no-else-return': 'error',
			'no-nested-ternary': 'error',
			'no-shadow': 'error',
			'no-unneeded-ternary': 'error',
			'no-useless-return': 'error',
		},
	},
];

export default eslintConfig;
