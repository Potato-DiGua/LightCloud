package com.potato.cloud.controller

import com.potato.cloud.annotations.PassAuth
import com.potato.cloud.model.ResponseWrap
import com.potato.cloud.model.form.LoginForm
import com.potato.cloud.properties.ConfigProperties
import com.potato.cloud.static.SessionKey
import com.potato.cloud.utils.CaptchaUtils
import kotlinx.coroutines.reactor.awaitSingle
import kotlinx.coroutines.reactor.mono
import org.slf4j.LoggerFactory
import org.springframework.http.MediaType
import org.springframework.http.server.reactive.ServerHttpResponse
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.server.ServerWebExchange
import reactor.core.publisher.Mono
import java.awt.image.BufferedImage
import java.io.ByteArrayOutputStream
import javax.imageio.ImageIO

@RestController
class UserController(val config: ConfigProperties) {
    private val logger = LoggerFactory.getLogger(this.javaClass)

    @PassAuth
    @PostMapping("/user/login")
    fun login(@RequestBody body: Mono<LoginForm>, exchange: ServerWebExchange): Mono<ResponseWrap<Boolean>> = mono {
        val session = exchange.session.awaitSingle()
        val json = body.awaitSingle()

        if (!json.randomCode.equals(session.getAttributeOrDefault(SessionKey.CAPTCHA, ""), true)) {
            return@mono ResponseWrap.error("验证码错误")
        }

        if (json.account == config.account &&
            json.pwd.trim().equals(config.pwdMD5, true)
        ) {
            session.attributes[SessionKey.LOGIN_STATE] = true
            return@mono ResponseWrap.success(true)
        } else {
            return@mono ResponseWrap.error("账号或密码错误")
        }
    }


    @PassAuth
    @GetMapping("/user/captcha", produces = [MediaType.IMAGE_JPEG_VALUE])
    fun getCaptchaImage(exchange: ServerWebExchange, response: ServerHttpResponse): Mono<ByteArray> {
        return exchange.session.flatMap exchange@{ session ->
            val captcha: Pair<String, BufferedImage> = CaptchaUtils.getImageCode(80, 30)
            session.attributes[SessionKey.CAPTCHA] = captcha.first
            val image = ByteArrayOutputStream()
            ImageIO.write(captcha.second, "jpg", image)
            return@exchange Mono.just(image.toByteArray())
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