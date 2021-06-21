package com.potato.cloud.controller

import com.potato.cloud.annotations.PassAuth
import com.potato.cloud.model.ResponseWrap
import com.potato.cloud.model.form.LoginForm
import com.potato.cloud.properties.ConfigProperties
import com.potato.cloud.static.SessionKey
import org.slf4j.LoggerFactory
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ServerWebExchange
import reactor.core.publisher.Mono

@RestController
class UserController(val config: ConfigProperties) {
    private val logger = LoggerFactory.getLogger(this.javaClass)

    @PassAuth
    @PostMapping("/user/login")
    fun login(@RequestBody body: Mono<LoginForm>, exchange: ServerWebExchange): Mono<ResponseWrap<Boolean>> {
        return body.flatMap { json ->
            if (json.account == config.account &&
                json.pwd.trim().equals(config.pwdMD5, true)
            ) {
                return@flatMap exchange.session.flatMap exchange@{ session ->
                    session.attributes[SessionKey.LOGIN_STATE] = true
                    return@exchange Mono.just(ResponseWrap.success(true))
                }
            } else {
                return@flatMap Mono.just(ResponseWrap.error("账号或密码错误"))
            }
        }
    }

    @PassAuth
    @GetMapping("/user/isLogin")
    fun isLogin(exchange: ServerWebExchange): Mono<ResponseWrap<Boolean>> {
        return exchange.session.map { session ->
            return@map if (session.attributes[SessionKey.LOGIN_STATE] == true) {
                ResponseWrap.success(true)
            } else {
                ResponseWrap.error("未登录")
            }
        }.onErrorReturn(ResponseWrap.error("未登录"))
    }
}