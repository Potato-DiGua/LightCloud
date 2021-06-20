package com.potato.cloud.interceptor

import com.potato.cloud.annotations.PassAuth
import com.potato.cloud.static.SessionKey
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.web.method.HandlerMethod
import org.springframework.web.reactive.result.method.annotation.RequestMappingHandlerMapping
import org.springframework.web.server.ServerWebExchange
import org.springframework.web.server.WebFilter
import org.springframework.web.server.WebFilterChain
import reactor.core.publisher.Mono

@Configuration
class LoginInterceptor : WebFilter {
    @Autowired
    lateinit var requestMappingHandlerMapping: RequestMappingHandlerMapping

    override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> {
        if (exchange.request.method == HttpMethod.OPTIONS) {
            return chain.filter(exchange)
        }
        return requestMappingHandlerMapping.getHandler(exchange).flatMap { handler ->
            if (isPassAuth(handler)) {
                return@flatMap chain.filter(exchange)
            }

            return@flatMap exchange.session.flatMap session@{ session ->
                if (session.attributes[SessionKey.LOGIN_STATE] == true) {
                    return@session chain.filter(exchange)
                } else {
                    exchange.response.rawStatusCode = 401
                    return@session exchange.response.writeAndFlushWith(Mono.empty())
                }
            }

        }
    }

    private fun isPassAuth(handler: Any): Boolean {
        if (handler is HandlerMethod) {
            return handler.method.getAnnotation(PassAuth::class.java) != null
        }
        return false
    }
}