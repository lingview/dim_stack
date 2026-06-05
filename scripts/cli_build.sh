sudo apt-get install gcc
conda install libpython-static
sudo apt install patchelf
nuitka --onefile --windows-console-mode=force --output-dir=o main.py

