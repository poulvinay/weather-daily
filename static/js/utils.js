export function convertToUserTime(timeString) {
    const date = new Date(timeString.replace(" ", "T") + ":00");
    return date.toLocaleString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

export const zoomBasedReveal = (value) => {
    return [
        "interpolate",
        ["linear"],
        ["zoom"],
        11,
        0.0,
        13,
        value
    ];
};
