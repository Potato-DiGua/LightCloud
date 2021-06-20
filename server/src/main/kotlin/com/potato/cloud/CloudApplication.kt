package com.potato.cloud

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
//@EnableConfigurationProperties
class CloudApplication

fun main(args: Array<String>) {
    runApplication<CloudApplication>(*args)
}
