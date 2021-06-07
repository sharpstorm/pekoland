function timeout(prom, time) {
  let timer;
  return Promise.race([
    prom,
    new Promise((res, rej) => timer = setTimeout(rej, time))
  ]).finally(() => clearTimeout(timer));
}

function loadAsset(url) {
  if (typeof(url) === 'string') {
    return timeout(new Promise((resolve) => {
      let asset = new Image();
      asset.onload = () => {
        resolve(asset);
      }
      asset.src = url;
    }), 5000);
  } else if (url.map !== undefined) {
    return timeout(Promise.all(url.map(x => loadAsset(x))), 5000);
  }
}

export { timeout, loadAsset };