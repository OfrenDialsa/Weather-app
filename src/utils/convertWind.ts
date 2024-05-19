export function ConvertWind(speedInMPS: number): string{
    const speenInKMH = speedInMPS *3.6;
    return`${speenInKMH.toFixed(0)}km/h`;
}