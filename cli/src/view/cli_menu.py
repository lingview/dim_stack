import os
from config.cli_config import CliConfig


class CliMenu:

    def __init__(self):
        self.config_manager = CliConfig()

    def show_menu(self):
        while True:
            self._clear_screen()
            self._print_header()
            self._print_current_config()
            self._print_menu_options()

            choice = input("\n请选择操作 [0-3]: ").strip()

            if choice == "1":
                self._set_project_dir()
            elif choice == "2":
                self._view_config()
            elif choice == "3":
                self._reset_config()
            elif choice == "0":
                print("\n再见!")
                break
            else:
                input("\n无效选择，按回车继续...")

    def _clear_screen(self):
        os.system("cls" if os.name == "nt" else "clear")

    def _print_header(self):
        print("=" * 50)
        print("Dim Stack CLI - 配置管理")
        print("=" * 50)

    def _print_current_config(self):
        project_dir = self.config_manager.get_project_dir()
        print(f"\n当前项目运行目录: {project_dir or '未设置'}")
        print("-" * 50)

    def _print_menu_options(self):
        print("\n菜单选项:")
        print("  1. 设置项目运行目录")
        print("  2. 查看配置详情")
        print("  3. 重置配置")
        print("  0. 退出")

    def _set_project_dir(self):
        print("\n--- 设置项目运行目录 ---")
        new_dir = input("请输入项目运行目录路径 (留空取消): ").strip()

        if not new_dir:
            print("已取消操作")
            input("\n按回车继续...")
            return

        new_dir = os.path.expanduser(new_dir)

        try:
            self.config_manager.set_project_dir(new_dir)
            print(f"\n✓ 项目运行目录已设置为: {os.path.abspath(new_dir)}")
        except ValueError as e:
            print(f"\n✗ 设置失败: {e}")

        input("\n按回车继续...")

    def _view_config(self):
        print("\n--- 配置详情 ---")

        if not self.config_manager.config_exists():
            print("配置文件不存在")
        else:
            config = self.config_manager.load_config()
            print(f"配置文件路径: {self.config_manager.config_path}")
            print(f"\n配置内容:")
            for key, value in config.items():
                print(f"  {key}: {value}")

        input("\n按回车继续...")

    def _reset_config(self):
        print("\n--- 重置配置 ---")
        confirm = input("确定要重置配置吗? (y/n): ").strip().lower()

        if confirm == "y":
            try:
                if self.config_manager.config_exists():
                    os.remove(self.config_manager.config_path)
                print("✓ 配置已重置")
            except Exception as e:
                print(f"✗ 重置失败: {e}")
        else:
            print("已取消操作")

        input("\n按回车继续...")
