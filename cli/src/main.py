import os
from config.config_read import Config

def main():
    print("Dim Stack CLI")
    config = Config()
    data = config.read_yaml("../../config/application.yml")
    print(data.server.port)

if __name__ == "__main__":
    main()