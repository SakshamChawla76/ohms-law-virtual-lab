import subprocess

token = subprocess.check_output(["gh", "auth", "token", "--user", "SakshamChawla76"]).decode().strip()
remote_url = f"https://{token}@github.com/SakshamChawla76/ohms-law-virtual-lab.git"

print("Pushing to main branch...")
result = subprocess.run(["git", "push", remote_url, "main"], capture_output=True, text=True)
print(result.stdout)
print(result.stderr)
if result.returncode == 0:
    print("Push SUCCESSFUL!")
else:
    print(f"Push failed with code {result.returncode}")
