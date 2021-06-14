function createElement(type, attributes, ...children) {
  const e = document.createElement(type);

  const k = Object.keys(attributes);
  for (let i = 0; i < k.length; i += 1) {
    if (typeof attributes[k[i]] === 'object') {
      const k2 = Object.keys(attributes[k[i]]);
      for (let j = 0; j < k2.length; j += 1) {
        if (k[i] === 'attributes') {
          e.setAttribute(k2[j], attributes[k[i]][k2[j]]);
        } else if (k[i] === 'eventListener') {
          e.addEventListener(k2[j], attributes[k[i]][k2[j]]);
        } else {
          e[k[i]][k2[j]] = attributes[k[i]][k2[j]];
        }
      }
    } else {
      e[k[i]] = attributes[k[i]];
    }
  }

  if (children !== undefined && children.length > 0) {
    children.forEach((x) => {
      if (x !== undefined && x !== null) {
        if (typeof x === 'string') {
          e.textContent = x;
        } else {
          e.appendChild(x);
        }
      }
    });
  }
  return e;
}

const dummy = () => {};

export { dummy as default, createElement };
