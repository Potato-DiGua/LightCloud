package com.potato.cloud.interceptor

import com.potato.cloud.annotations.PassAuth
import com.potato.cloud.static.SessionKey
import kotlinx.coroutines.reactor.awaitSingle
import kotlinx.coroutines.reactor.awaitSingleOrNull
import kotlinx.coroutines.reactor.mono
import org.slf4j.LoggerFactory
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
    private val logger = LoggerFactory.getLogger(this.javaClass)

    @Autowired
    lateinit var requestMappingHandlerMapping: RequestMappingHandlerMapping

    //    override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> {
//        if (exchange.request.method == HttpMethod.OPTIONS) {
//            return chain.filter(exchange)
//        }
//
//        return requestMappingHandlerMapping.getHandler(exchange)
//            .switchIfEmpty(chain.filter(exchange))
//            .flatMap { handler ->
//                if (isPassAuth(handler)) {
//                    return@flatMap chain.filter(exchange)
//                }
//                return@flatMap exchange.session.flatMap session@{ session ->
//                    if (session.attributes[SessionKey.LOGIN_STATE] == true) {
//                        return@session chain.filter(exchange)
//                    } else {
//                        exchange.response.rawStatusCode = 401
//                        return@session exchange.response.writeAndFlushWith(Mono.empty())
//                    }
//                }
//            }
//    }
    override fun filter(exchange: ServerWebExchange, chain: WebFilterChain): Mono<Void> {
        if (exchange.request.method == HttpMethod.OPTIONS) {
            return chain.filter(exchange)
        }

        return mono {
            val handler = requestMappingHandlerMapping.getHandler(exchange).awaitSingleOrNull()
            if (handler == null) {
                return@mono true
            } else {
                if (isPassAuth(handler)) {
                    return@mono true
                } else {
                    val session = exchange.session.awaitSingle()
                    return@mono session.attributes[SessionKey.LOGIN_STATE] == true
                }
            }
        }.flatMap {
            return@flatMap if (it) {
                chain.filter(exchange)
            } else {
                exchange.response.rawStatusCode = 401
                exchange.response.writeAndFlushWith(Mono.empty())
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