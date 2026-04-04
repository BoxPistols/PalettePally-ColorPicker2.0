// W3C Design Tokens Community Group (DTCG) format
// https://tr.designtokens.org/format/

export type DTCGToken = {
  $value: string;
  $type: 'color';
  $description?: string;
};

export type DTCGGroup = {
  [key: string]: DTCGToken | DTCGGroup | string | undefined;
  $description?: string;
};

export type DTCGFile = {
  [collectionName: string]: DTCGGroup;
};
