from pydantic import BaseModel, Field, field_validator
import re

def parse_duration(value: str | int) -> int:
    if isinstance(value, (int, float)):
        return int(value)
    value = str(value).strip().lower()
    match = re.match(r'^(-?\d+)(ms|s|m|h)?$', value)
    if not match:
        raise ValueError(f"Invalid duration format: {value}")
    num, unit = int(match.group(1)), match.group(2) or 'ms'
    multipliers = {'ms': 1, 's': 1000, 'm': 60000, 'h': 3600000}
    return num * multipliers[unit]

class VirtualThreadsConfig(BaseModel):
    enabled: bool = False

class JacksonConfig(BaseModel):
    time_zone: str = Field(default="GMT+8", alias="time-zone")
    date_format: str = Field(default="yyyy-MM-dd HH:mm:ss", alias="date-format")

    model_config = {"populate_by_name": True}

class HikariConfig(BaseModel):
    maximum_pool_size: int = Field(default=20, alias="maximum-pool-size")
    minimum_idle: int = Field(default=5, alias="minimum-idle")
    connection_timeout: int = Field(default=30000, alias="connection-timeout")
    idle_timeout: int = Field(default=600000, alias="idle-timeout")
    max_lifetime: int = Field(default=1800000, alias="max-lifetime")

    model_config = {"populate_by_name": True}

class DatasourceConfig(BaseModel):
    driver_class_name: str = Field(alias="driver-class-name")
    url: str
    username: str
    password: str
    hikari: HikariConfig = Field(default_factory=HikariConfig)

    model_config = {"populate_by_name": True}

class MultipartConfig(BaseModel):
    enabled: bool = True
    max_file_size: str = Field(default="100MB", alias="max-file-size")
    max_request_size: str = Field(default="100MB", alias="max-request-size")

    model_config = {"populate_by_name": True}

class ServletConfig(BaseModel):
    multipart: MultipartConfig = Field(default_factory=MultipartConfig)

class LettucePoolConfig(BaseModel):
    max_active: int = Field(default=8, alias="max-active")
    max_idle: int = Field(default=8, alias="max-idle")
    min_idle: int = Field(default=0, alias="min-idle")
    max_wait: int = Field(default=-1, alias="max-wait")

    @field_validator("max_wait", mode="before")
    @classmethod
    def convert_max_wait(cls, v):
        return parse_duration(v)

    model_config = {"populate_by_name": True}

class LettuceConfig(BaseModel):
    pool: LettucePoolConfig = Field(default_factory=LettucePoolConfig)

class RedisDataConfig(BaseModel):
    host: str = "127.0.0.1"
    port: int = 6379
    database: int = 0
    timeout: int = 5000
    lettuce: LettuceConfig = Field(default_factory=LettuceConfig)

    @field_validator("timeout", mode="before")
    @classmethod
    def convert_timeout(cls, v):
        return parse_duration(v)

    model_config = {"populate_by_name": True}

class ThymeleafServletConfig(BaseModel):
    content_type: str = Field(default="text/html", alias="content-type")
    model_config = {"populate_by_name": True}

class ThymeleafConfig(BaseModel):
    cache: bool = True
    prefix: str = "classpath:/templates/"
    suffix: str = ".html"
    encoding: str = "UTF-8"
    servlet: ThymeleafServletConfig = Field(default_factory=ThymeleafServletConfig)

class MyBatisConfig(BaseModel):
    type_aliases_package: str = Field(alias="type-aliases-package")
    mapper_locations: str = Field(alias="mapper-locations")
    config_location: str = Field(alias="config-location")

    model_config = {"populate_by_name": True}

class TomcatConfig(BaseModel):
    uri_encoding: str = Field(default="UTF-8", alias="uri-encoding")
    threads_max: int = Field(default=200, alias="threads.max")
    threads_min_spare: int = Field(default=10, alias="threads.min-spare")
    remoteip_protocol_header: str = Field(default="X-Forwarded-Proto", alias="remoteip.protocol-header")
    remoteip_remote_ip_header: str = Field(default="X-Forwarded-For", alias="remoteip.remote-ip-header")

    model_config = {"populate_by_name": True}

class ServerConfig(BaseModel):
    port: int = 2222
    servlet_context_path: str = Field(default="/", alias="servlet.context-path")
    tomcat: TomcatConfig = Field(default_factory=TomcatConfig)
    forward_headers_strategy: str = Field(default="native", alias="forward-headers-strategy")

    model_config = {"populate_by_name": True}

class LoggingLevelConfig(BaseModel):
    xyz_lingview_dimstack: str = Field(default="info", alias="xyz.lingview.dimstack")
    org_springframework: str = Field(default="warn", alias="org.springframework")
    org_springframework_security: str = Field(default="info", alias="org.springframework.security")
    org_springframework_session: str = Field(default="info", alias="org.springframework.session")
    org_springframework_web: str = Field(default="info", alias="org.springframework.web")

    model_config = {"populate_by_name": True}

class LoggingConfig(BaseModel):
    level: LoggingLevelConfig = Field(default_factory=LoggingLevelConfig)

class FileConfig(BaseModel):
    data_root: str = Field(default=".", alias="data-root")
    upload_dir: str = Field(default="upload", alias="upload-dir")
    log_root: str = Field(default=".", alias="log-root")

    model_config = {"populate_by_name": True}

class AppRedisConfig(BaseModel):
    enabled: bool = False

class ThemeConfig(BaseModel):
    active_theme: str = Field(default="default", alias="active-theme")
    themes_path: str = Field(default="themes", alias="themes-path")

    model_config = {"populate_by_name": True}

class AppConfig(BaseModel):
    redis: AppRedisConfig = Field(default_factory=AppRedisConfig)
    theme: ThemeConfig = Field(default_factory=ThemeConfig)

class SpringConfig(BaseModel):
    threads_virtual: VirtualThreadsConfig = Field(
        default_factory=VirtualThreadsConfig, alias="threads.virtual"
    )
    jackson: JacksonConfig = Field(default_factory=JacksonConfig)
    datasource: DatasourceConfig
    servlet: ServletConfig = Field(default_factory=ServletConfig)
    data_redis: RedisDataConfig = Field(alias="data.redis", default_factory=RedisDataConfig)
    thymeleaf: ThymeleafConfig = Field(default_factory=ThymeleafConfig)

    model_config = {"populate_by_name": True}

class DimStackConfig(BaseModel):
    spring: SpringConfig
    mybatis: MyBatisConfig
    server: ServerConfig = Field(default_factory=ServerConfig)
    logging: LoggingConfig = Field(default_factory=LoggingConfig)
    file: FileConfig = Field(default_factory=FileConfig)
    app: AppConfig = Field(default_factory=AppConfig)

    model_config = {"populate_by_name": True}