FROM alpine:latest

LABEL maintainer="lingview <official@lingview.xyz>"

RUN sed -i 's|https\?://dl-cdn.alpinelinux.org/alpine|https://mirrors.tuna.tsinghua.edu.cn/alpine|g' /etc/apk/repositories

RUN apk update
RUN apk add --no-cache openjdk21-jre wget

RUN addgroup -g 1001 -S dimstack && \
    adduser -u 1001 -S dimstack -G dimstack

RUN mkdir -p /dim_stack && \
    chown -R dimstack:dimstack /dim_stack

WORKDIR /dim_stack

RUN wget -O dimstack-1.0-SNAPSHOT.jar https://update.apilinks.cn/dimstack/dimstack-1.0-SNAPSHOT.jar && \
    chown dimstack:dimstack dimstack-1.0-SNAPSHOT.jar

USER dimstack

EXPOSE 2222

CMD ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "dimstack-1.0-SNAPSHOT.jar", "--server.port=2222"]