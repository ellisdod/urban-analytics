/**
* Calculate the center/average of multiple GeoLocation coordinates
*
* @url http://stackoverflow.com/a/14231286/538646
*/
function center(coords) {
  console.log('finding center of coords', coords, coords.length)

  let x = 0.0,
  y = 0.0,
  z = 0.0;

  for (let coord of coords) {
    console.log('coord', coord)
    if (Array.isArray(coord[0])) coord = center(coord) // in case nested array eg multi polygon
    let latitude = coord[1] * Math.PI / 180;
    let longitude = coord[0] * Math.PI / 180;

    x += Math.cos(latitude) * Math.cos(longitude);
    y += Math.cos(latitude) * Math.sin(longitude);
    z += Math.sin(latitude);
  }

  let total = coords.length;

  x = x / total;
  y = y / total;
  z = z / total;

  let centralLongitude = Math.atan2(y, x);
  let centralSquareRoot = Math.sqrt(x * x + y * y);
  let centralLatitude = Math.atan2(z, centralSquareRoot);

  return [
    centralLongitude * 180 / Math.PI,
    centralLatitude * 180 / Math.PI
  ];
}

module.exports = center
