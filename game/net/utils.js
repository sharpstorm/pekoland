function timeout(prom, time) {
  let timer;
  return Promise.race([
    prom,
    new Promise((res, rej) => timer = setTimeout(rej, time))
  ]).finally(() => clearTimeout(timer));
}

export { timeout };