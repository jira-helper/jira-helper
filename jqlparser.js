import { filter, highlight, parse, test } from 'liqe';

const jqlText = 'type:"accentapce bug" AND NOT status:"done"';
const parsedJQLTree = parse(jqlText);
console.log(parsedJQLTree);
