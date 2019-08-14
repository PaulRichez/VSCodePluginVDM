
import * as vscode from 'vscode';
import * as path from 'path';
var request = require('request');
var DomParser = require('dom-parser');

function replaceChar(string: string) {
	return string.replace(/\n/g, " ").replace(/&nbsp;/g, "").replace(/&#039;/g, "'").replace(/&quot;/g, '"');
}
export function activate(context: vscode.ExtensionContext) {

	let disposable = vscode.commands.registerCommand('extension.vdm', () => {
		request('https://www.viedemerde.fr/aleatoire', function (error: any, response: { statusCode: number; }, body: any) {
			if (body && !error && response.statusCode === 200) {
				const newFile = vscode.Uri.parse('untitled:' + path.join('', 'vdm.js'));
				vscode.workspace.openTextDocument(newFile).then(document => {
					const edit = new vscode.WorkspaceEdit();
					var parser = new DomParser();
					var dom = parser.parseFromString(body);

					const allVdm = dom.getElementsByClassName('panel panel-classic');
					let content = '';
					allVdm.forEach((vdm: any) => {
						content += '//' + replaceChar(vdm.getElementsByClassName('article-topbar')[0].textContent) + '\n';
						content += replaceChar(vdm.getElementsByClassName('article-link')[0].textContent) + '\n';
					});
					edit.insert(newFile, new vscode.Position(0, 0), content);
					return vscode.workspace.applyEdit(edit).then(success => {
						if (success) {
							vscode.window.showTextDocument(document);
						} else {
							vscode.window.showInformationMessage('Error!');
						}
					});
				});
			} else {
				vscode.window.showErrorMessage('Erreur lors de la réception des VDM!');
			}
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
