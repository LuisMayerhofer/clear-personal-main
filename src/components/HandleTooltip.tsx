import Tooltip, { TooltipRef } from 'rc-tooltip';
import { FC, PropsWithChildren, useEffect, useRef } from 'react';
import raf from 'rc-util/lib/raf';
import { SliderProps } from 'rc-slider';

export type HandleTooltipProps = PropsWithChildren<{
	value: number;
	visible: boolean;
	tipFormatter?: (value: number) => React.ReactNode;
}>;

const HandleTooltip: FC<HandleTooltipProps> = (props) => {
	const { value, children, visible, tipFormatter = (val) => `${val} %`, ...restProps } = props;

	const tooltipRef = useRef<TooltipRef>(null);
	const rafRef = useRef<number | null>(null);

	const cancelKeepAlign = () => {
		raf.cancel(rafRef.current!);
	};

	const keepAlign = () => {
		rafRef.current = raf(() => {
			tooltipRef.current?.forceAlign();
		});
	};

	useEffect(() => {
		if (visible) {
			keepAlign();
		} else {
			cancelKeepAlign();
		}

		return cancelKeepAlign;
	}, [value, visible]);

	return (
		<Tooltip
			placement="top"
			overlay={tipFormatter(value)}
			ref={tooltipRef}
			visible={visible}
			{...restProps}
		>
			{children as React.ReactElement}
		</Tooltip>
	);
};

export const handleRender: SliderProps['handleRender'] = (node, props) => (
	<HandleTooltip value={props.value} visible={props.dragging}>
		{node}
	</HandleTooltip>
);

export default HandleTooltip;
