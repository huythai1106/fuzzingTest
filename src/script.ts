import { exec, ExecException } from "child_process";

async function executeCommands(commands: string[] | Set<string>) {
  for (const command of commands) {
    try {
      const { stdout, stderr } = await executeCommand(command);
      console.log(`Command: ${command}`);
      console.log(`Output: ${stdout}`);
      console.error(`Errors: ${stderr}`);
    } catch (err: any) {
      console.error(`Command failed: ${err.error}`);
      console.error(`Errors: ${err.stderr}`);
    }
  }
}

function executeCommand(command: string): Promise<{ stdout: string; stderr: string }> {
  return new Promise((resolve, reject) => {
    exec(command, (error: ExecException | null, stdout: string, stderr: string) => {
      if (error) {
        reject({ error, stderr });
        return;
      }
      resolve({ stdout, stderr });
    });
  });
}

export default executeCommands;
