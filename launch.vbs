' コンソールウィンドウなしで GUI を起動します
Dim shell, dir
Set shell = CreateObject("WScript.Shell")
dir = CreateObject("Scripting.FileSystemObject").GetParentFolderName(WScript.ScriptFullName)
shell.Run "cmd /c cd /d """ & dir & """ && npm run gui", 0, False
