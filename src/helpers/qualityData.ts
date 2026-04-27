export const getQualityData = (quality: number) => {
  switch (quality) {
    case -1:
      return { color: "rgb(140, 70, 55)", name: 'Grisly' }
    case 0:
      return { color: "rgb(180, 120, 65)", name: 'Terrible' }
    case 1:
      return { color: "rgb(200, 165, 55)", name: 'Poor' }
    case 2:
      return { color: "rgb(170, 175, 45)", name: 'Standard' }
    case 3:
      return { color: "rgb(90, 165, 85)", name: 'Good' }
    case 4:
      return { color: "rgb(50, 165, 145)", name: 'Great' }
    case 5:
      return { color: "rgb(80, 145, 215)", name: 'Superb' }
    case 6:
      return { color: "rgb(200, 110, 230)", name: 'Ambrosial' }
    default:
      return { color: 'inherit', name: 'Unknown' };
  }
};