常见获取的只有请求头和net相关的

首先我门先看看请求头这一块 

# UA头：
比较明显的就是有的测试人员比较逆天根本不看包的如下：

```plain
User-Agent: Burp Suite Professional  
```

```plain
 Mozilla/5.0 (compatible; Burp Suite)  
```

#  
| 工具 |  UA 特征   |
| --- | --- |
|  sqlmap   |  sqlmap/   |
|  curl   |  curl/   |
|  python requests   |  python-requests/   |
|  Go http   |  Go-http-client/   |
| java |  Java/   |
| wget |  wget/   |








# Accept-Encoding 特征  ：
浏览器一般：

```plain
gzip, deflate, br
```

Burp 常见：

```plain
gzip, deflate
```

```plain
 identity  
```

# Connection 行为：
浏览器：

```plain
Connection: keep-alive
```

Burp：

```plain
Connection: close
```

# <font style="background-color:#FBDE28;">Header 顺序：</font>
常用浏览器 header是固定**顺的**

如 Chrome：

```plain
Host
Connection
sec-ch-ua
sec-ch-ua-mobile
sec-ch-ua-platform
Upgrade-Insecure-Requests
User-Agent
Accept
Sec-Fetch-Site
Sec-Fetch-Mode
Sec-Fetch-User
Sec-Fetch-Dest
Accept-Encoding
Accept-Language
```

Burp 顺序通常：

```plain
Host
User-Agent
Accept
Connection
```

#  参数 fuzz 行为 ：
这个就很好理解

```plain
?id=1
?id=2
?id=3
?id=4
```

# 
