import { ArgumentParser } from "argparse";

/**
 * Argument Parser
 */
export const parseArguments = () => {
	const parser = new ArgumentParser({
		description: "luceki client script"
	});
	parser.add_argument("--url", {
		type: "str",
		default: "wss://msoll.de/spe_ed",
		help: "Game Server Url"
	});
	parser.add_argument("--key", {
		type: "str",
		default: "keinKey",
		help: "Team Key"
	});
	parser.add_argument("--timeUrl", {
		type: "str",
		default: "https://msoll.de/spe_ed_time",
		help: "Time Server Url"
	});
	parser.add_argument("--clientPort", {
		type: "int",
		default: 443,
		help: "Client Port Url"
	});
	parser.add_argument("--test", {
		type: "int",
		default: 0,
		help: "Is this a test run? 0: false, 1: true"
	});
	parser.add_argument("--autoStart", {
		type: "str",
		default: "no",
		help: "Start an instance with autostart and an given tactic"
	});
	return parser.parse_args();
};