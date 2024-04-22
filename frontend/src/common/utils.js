export const formatAmount = value => `₦${new Intl.NumberFormat('en-US').format(parseFloat(value.toString().replace(/[^\d.]/g, '')).toFixed(2))}`;
// export const formatAmount = value => `₦${Number(value).toLocaleString("en-US")}`;
export const formatAmountFraction = value => `₦${Number(value).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits:2})}`;
export const formatNumber = value => new Intl.NumberFormat('en-US').format(parseFloat(value.toString().replace(/[^\d.]/g, '')).toFixed(2));
export const formatNumberToFloat = value => parseFloat(value.toString().replace(/,/g, ''));
export const formatNumberFraction = value => Number(value).toLocaleString("en-US", {minimumFractionDigits: 2, maximumFractionDigits:2});

export const formatNumber_ = (value) => {
  // const stringValue = value.toString().replace(/[^\d.]/g, ''); // Remove non-numeric characters
  // const numericValue = parseInt(stringValue, 10); // Convert the string to a numeric value
  const numericValue = parseFloat(value.toString().replace(/[^\d.]/g, '')).toFixed(2); // Remove non-numeric characters except the dot
  
  if (isNaN(numericValue)) {
    // Handle the case where the value is not a valid number
    return ''; // or any other default value or error handling strategy
  }

  return new Intl.NumberFormat('en-US').format(numericValue);
};

export const formatNumberInput = (value) => {
  
  value = '00'+value.replace(/[^\d]/g, '')

  const index = value.length - 1; 

  let integerPart = value.slice(0, index);
  let decimalPart = value.slice(index);

  if(decimalPart.length < 2){
    decimalPart = integerPart.slice(-1) + decimalPart
    integerPart = integerPart.slice(0, -1)
  }else{
    integerPart += decimalPart.slice(0, -2);
    decimalPart = decimalPart.slice(1)
  }

  return `${formatNumber(integerPart)}.${decimalPart}`;  
};
    
export const calculateTimeLeft = (targetDate) => {
  const now = new Date().getTime();
  const difference = new Date(targetDate) - now;

  if (difference > 0) {
    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    // Build an array of non-zero units
    const nonZeroUnits = [];
    if (days > 0) nonZeroUnits.push(`${days}`.padStart(2,0));
    if (hours > 0) nonZeroUnits.push(`${hours}`.padStart(2,0));
    if (minutes > 0) nonZeroUnits.push(`${minutes}`.padStart(2,0));
    nonZeroUnits.push(`${seconds}`.padStart(2,0));

    // Join the units into a string
    const formattedTime = nonZeroUnits.join(':');
    
    return formattedTime;
  }
};

export const setAlpha = (color, alpha)=> {
    let rgb;

  // If the input is in hexadecimal format, convert it to RGB
  if (color.startsWith('#')) {
    rgb = hexToRgb(color);
  } else if (color.startsWith('rgba')) {
    // If the input is already in RGBA format
    const match = color.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (match) {
      rgb = { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
    }
  } else if (color.startsWith('rgb')) {
    // If the input is in RGB format
    const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (match) {
      rgb = { r: parseInt(match[1]), g: parseInt(match[2]), b: parseInt(match[3]) };
    }
  }

  if (rgb) {
    // Return the RGBA value with the specified alpha
    return `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${alpha})`;
  }

  // If the input is not recognized, return null or handle accordingly
  return color;
}

const hexToRgb = (hex)=> {
  hex = hex.replace(/^#/, '');
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

export const avatars = Object.values(import.meta.glob('../../public/assets/avatars/*.{png,jpg,jpeg,PNG,JPEG}', { eager: true, as: 'url' }))


const betproCalc = (odds, steps, bankroll, profit)=>{
   const stakes = [ ]
   const p = profit || 1; // profit is the expected profit that must be ensured per stake
   
   for(let i=1; i<=steps; i++){
      const sum = stakes.reduce((accumulator, currentValue)=>accumulator + currentValue, 0)
      const nextStake = (i*p+sum)/(odds-1)
      stakes.push(nextStake)
   }

   let newStakes = [ ]
   if(!profit){
      const sum = stakes.reduce((accumulator, currentValue)=> accumulator + currentValue, 0)
      newStakes= stakes.map(stake => stake/sum * bankroll)
   }else{
      newStakes = stakes
   }
   
   return newStakes;
}

export const estimateRoi = (odds, steps, numberOfStakes)=>{

  // eslint-disable-next-line no-unused-vars
  let bankroll = 100//parseFloat(bankroll.toString().replace(/,/g, ''));

  let newBankroll = bankroll;

  let newNumberOfStakes = 0;
  
  while(newNumberOfStakes < numberOfStakes){
    const timeToAdd = Math.floor(Math.random() * parseInt(steps/2)) + 1;
    const stakes = betproCalc(odds, steps, newBankroll);
    const minProfit = stakes[0]*odds-stakes[0];
    
    newBankroll += minProfit*timeToAdd;

    newNumberOfStakes += timeToAdd
  }
   
   const formatNumber = value => new Intl.NumberFormat('en-US').format(value.toFixed(2))//Number(value).toLocaleString("en-US");
   
   const percentIncrease = formatNumber((newBankroll-bankroll)/bankroll * 100)

  return isNaN(percentIncrease)? 0 : `${Math.round(percentIncrease)}`
}

export const getNextStakeAmount = (odds, steps, bankroll, failCount)=>{

  const stakes = betproCalc(odds, steps, bankroll)

  return stakes[failCount]? formatNumber(stakes[failCount]):''

}