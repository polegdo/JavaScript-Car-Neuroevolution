const singlePrecisionBytesLength = 4; // 32 bits
const doublePrecisionBytesLength = 8; // 64 bits
const bitsInByte = 8;

/**
 * Converts the float number into its IEEE 754 binary representation.
 * @see: https://en.wikipedia.org/wiki/IEEE_754
 *
 * @param {number} floatNumber - float number in decimal format.
 * @param {number} byteLength - number of bytes to use to store the float number.
 * @return {string} - binary string representation of the float number.
 */
function floatAsBinaryString(floatNumber, byteLength) {
    let numberAsBinaryString = '';
  
    const arrayBuffer = new ArrayBuffer(byteLength);
    const dataView = new DataView(arrayBuffer);
  
    const byteOffset = 0;
    const littleEndian = false;
  
    if (byteLength === singlePrecisionBytesLength) {
      dataView.setFloat32(byteOffset, floatNumber, littleEndian);
    } else {
      dataView.setFloat64(byteOffset, floatNumber, littleEndian);
    }
  
    for (let byteIndex = 0; byteIndex < byteLength; byteIndex += 1) {
      let bits = dataView.getUint8(byteIndex).toString(2);
      if (bits.length < bitsInByte) {
        bits = new Array(bitsInByte - bits.length).fill('0').join('') + bits;
      }
      numberAsBinaryString += bits;
    }
  
    return numberAsBinaryString;
  }
  
  /**
   * Converts the float number into its IEEE 754 64-bits binary representation.
   *
   * @param {number} floatNumber - float number in decimal format.
   * @return {string} - 64 bits binary string representation of the float number.
   */
  function floatAs64BinaryString(floatNumber) {
    return floatAsBinaryString(floatNumber, doublePrecisionBytesLength);
  }
  
  /**
   * Converts the float number into its IEEE 754 32-bits binary representation.
   *
   * @param {number} floatNumber - float number in decimal format.
   * @return {string} - 32 bits binary string representation of the float number.
   */
  function floatAs32BinaryString(floatNumber) {
    return floatAsBinaryString(floatNumber, singlePrecisionBytesLength);
  }

  function mean(numbers) {
    var total = 0, i;
    for (i = 0; i < numbers.length; i += 1) {
        total += numbers[i];
    }
    return total / numbers.length;
 }

 function median(numbers) {
    // median of [3, 5, 4, 4, 1, 1, 2, 3] = 3
    var median = 0, numsLen = numbers.length;
    numbers.sort();
 
    if (
        numsLen % 2 === 0 // is even
    ) {
        // average of two middle numbers
        median = (numbers[numsLen / 2 - 1] + numbers[numsLen / 2]) / 2;
    } else { // is odd
        // middle number only
        median = numbers[(numsLen - 1) / 2];
    }
 
    return median;
 }

function lerp(A,B,t){
    return A+(B-A)*t;
}

function getRandomArbitrary(min, max){
    return Math.random()*(max-min)+min;
}

function getRandomIntInclusive(min, max){
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min); // The maximum is inclusive and the minimum is inclusive
}

function getIntersection(A,B,C,D){ 
    const tTop=(D.x-C.x)*(A.y-C.y)-(D.y-C.y)*(A.x-C.x);
    const uTop=(C.y-A.y)*(A.x-B.x)-(C.x-A.x)*(A.y-B.y);
    const bottom=(D.y-C.y)*(B.x-A.x)-(D.x-C.x)*(B.y-A.y);
    
    if(bottom!=0){
        const t=tTop/bottom;
        const u=uTop/bottom;
        if(t>=0 && t<=1 && u>=0 && u<=1){
            return {
                x:lerp(A.x,B.x,t),
                y:lerp(A.y,B.y,t),
                offset:t
            }
        }
    }

    return null;
}

function polysIntersect(poly1, poly2){
    for(let i=0;i<poly1.length;i++){
        for(let j=0;j<poly2.length;j++){
            const touch=getIntersection(
                poly1[i],
                poly1[(i+1)%poly1.length],
                poly2[j],
                poly2[(j+1)%poly2.length]
            );
            if(touch){
                return true;
            }
        }
    }
    return false;
}

function getRGBA(value){
    const alpha=Math.abs(value);
    const R=value<0?0:255;
    const G=R;
    const B=value>0?0:255;
    return "rgba("+R+","+G+","+B+","+alpha+")";
}

function getRandomColor(){
    const hue=290+Math.random()*260;
    return "hsl("+hue+", 100%, 60%)";
}
                