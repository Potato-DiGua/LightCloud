package com.potato.cloud.properties

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.stereotype.Component
import org.springframework.util.DigestUtils

@Component
@ConfigurationProperties(prefix = "config")
data class ConfigProperties(
    var filePath: String = "",
    var account: String = "root",
) {
    var pwd: String = "000000"
        set(value) {
            field = value
            pwdMD5 = DigestUtils.md5DigestAsHex(pwd.toByteArray())
        }

    var pwdMD5: String = ""
}