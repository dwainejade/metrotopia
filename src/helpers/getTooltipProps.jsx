
const getTooltipProps = (placement = 'bottom') => ({
    animation: 'shift',
    duration: [250, 50],  // [enter, leave] durations in ms
    placement,
    className: `tippy-${placement}`
});

export const getPopoverProps = (placement = "top") => ({
    interactive: true,
    trigger: "click",
    hideOnClick: true,
    placement,
    animation: "shift-away-subtle",
    arrow: false,

});

export default getTooltipProps;