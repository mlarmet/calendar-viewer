export type HeaderProps = {
	startClasseCode: string;
	startPvpCode: string;
	onClasseChange: (classeName: string) => void;
	onPvpChange: (pvpName: string) => void;
};

export type Option = { value: string; label: string };
