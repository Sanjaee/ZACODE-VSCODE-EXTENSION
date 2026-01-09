import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import simpleGit, { SimpleGit } from 'simple-git';

interface Repository {
    label: string;
    url: string;
    description: string;
}

const repositories: Repository[] = [
    {
        label: 'Flutter Template Login',
        url: 'https://github.com/Sanjaee/FLUTTER-TEMPLATE-LOGIN.git',
        description: 'Repository Flutter Template Login'
    },
    {
        label: 'Go Template Login',
        url: 'https://github.com/Sanjaee/GO-TEMPLATE-LOGIN.git',
        description: 'Repository Go Template Login'
    },
    {
        label: 'Next Template Login',
        url: 'https://github.com/Sanjaee/NEXT-TEMPLATE-LOGIN.git',
        description: 'Repository Next Template Login'
    },
    {
        label: 'Next Drizzle (MVC) Template Login',
        url: 'https://github.com/Sanjaee/NEXT-DRIZZEL-TEMPLATE-LOGIN.git',
        description: 'Repository Next Drizzle Template Login'
    },
    {
        label: 'Express Template Login',
        url: 'https://github.com/Sanjaee/EXPRESS-TEMPLATE-LOGIN.git',
        description: 'Repository Express Template Login'
    },
    {
        label: 'Kotlin Template Login',
        url: 'https://github.com/Sanjaee/KOTLIN-TEMPLATE-LOGIN.git',
        description: 'Repository Kotlin Template Login'
    }
];

export function activate(context: vscode.ExtensionContext) {
    console.log('Zacode Clone Extension Active!');

    context.subscriptions.push(
        vscode.commands.registerCommand('sanjaee.cloneFlutter', () => cloneSelectedRepo(repositories[0])),
        vscode.commands.registerCommand('sanjaee.cloneGo', () => cloneSelectedRepo(repositories[1])),
        vscode.commands.registerCommand('sanjaee.cloneNext', () => cloneSelectedRepo(repositories[2])),
        vscode.commands.registerCommand('sanjaee.cloneNextDrizzle', () => cloneSelectedRepo(repositories[3])),
        vscode.commands.registerCommand('sanjaee.cloneExpress', () => cloneSelectedRepo(repositories[4])),
        vscode.commands.registerCommand('sanjaee.cloneKotlin', () => cloneSelectedRepo(repositories[5])),
    );
}

async function cloneSelectedRepo(repo: Repository) {
    let targetFolder: string;

    if (vscode.workspace.workspaceFolders?.length) {
        targetFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;
    } else {
        const folderUri = await vscode.window.showOpenDialog({
            canSelectFiles: false,
            canSelectFolders: true,
            canSelectMany: false,
            openLabel: 'Pilih Folder'
        });
        if (!folderUri) return;

        targetFolder = folderUri[0].fsPath;
    }

    const clonePath = targetFolder;

    await cloneRepository(repo.url, clonePath, repo.label);
}

async function cloneRepository(repoUrl: string, targetPath: string, repoLabel: string) {
    const outputChannel = vscode.window.createOutputChannel('Zacode Clone');
    outputChannel.show();

    try {
        await vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: `Cloning ${repoLabel}`,
                cancellable: false
            },
            async (progress) => {
                progress.report({ message: 'Mengunduh repository...' });

                const git: SimpleGit = simpleGit({ baseDir: targetPath });

                await git.clone(repoUrl, targetPath, ['--progress']);

                // Ekstrak nama folder repository dari URL
                const repoName = path.basename(repoUrl, '.git');
                const repoFolderPath = path.join(targetPath, repoName);
                const gitFolderPathInRepo = path.join(repoFolderPath, '.git');
                const gitFolderPathDirect = path.join(targetPath, '.git');

                // Hapus folder .git jika ada (cek di subfolder atau langsung di targetPath)
                progress.report({ message: 'Menghapus folder .git...' });
                if (fs.existsSync(gitFolderPathInRepo)) {
                    fs.rmSync(gitFolderPathInRepo, { recursive: true, force: true });
                } else if (fs.existsSync(gitFolderPathDirect)) {
                    fs.rmSync(gitFolderPathDirect, { recursive: true, force: true });
                }

                vscode.commands.executeCommand('workbench.files.action.refreshFilesExplorer');
            }
        );

        vscode.window.showInformationMessage(`Clone ${repoLabel} selesai!`);
    } catch (error: any) {
        vscode.window.showErrorMessage(`Gagal clone: ${error.message}`);
    }
}

export function deactivate() {}
