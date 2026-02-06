import Slider, { SliderProps } from 'rc-slider';
import { FC } from 'react';
import HandleTooltip, { HandleTooltipProps } from './HandleTooltip';

interface TooltipSliderProps extends SliderProps {
	tipFormatter?: (value: number) => React.ReactNode;
	tipProps?: HandleTooltipProps;
}

const TooltipSlider: FC<TooltipSliderProps> = ({ tipFormatter, tipProps, ...props }) => {
	const tipHandleRender: SliderProps['handleRender'] = (node, handleProps) => (
		<HandleTooltip
			value={handleProps.value}
			visible={handleProps.dragging}
			tipFormatter={tipFormatter}
			{...tipProps}
		>
			{node}
		</HandleTooltip>
	);

	return <Slider {...props} handleRender={tipHandleRender} />;
};

export default TooltipSlider;
