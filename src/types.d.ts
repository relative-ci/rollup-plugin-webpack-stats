export type ExcludeFilepathParam = string | RegExp | ((filepath: string) => boolean);

export type ExcludeFilepathOption = ExcludeFilepathParam | Array<ExcludeFilepathParam>;
