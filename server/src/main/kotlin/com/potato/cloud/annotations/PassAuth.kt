package com.potato.cloud.annotations


/**
 * 跳过登录校验
 */
@kotlin.annotation.Target(AnnotationTarget.FUNCTION)
@kotlin.annotation.Retention(AnnotationRetention.RUNTIME)
@MustBeDocumented
annotation class PassAuth()
