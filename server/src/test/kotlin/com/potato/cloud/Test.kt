package com.potato.cloud

import org.junit.jupiter.api.Test
import reactor.core.publisher.Flux
import reactor.core.publisher.Mono


class Test {
    @Test
    fun test() {
        Flux.fromArray<String?>(arrayOf(null, "fu", "ck"))
            .filter { !it.isNullOrBlank() }
//            .switchIfEmpty(Mono.just("hlw"))
//            .map {
//                println("1")
//                println(it)
//                println("--------------")
//                it.plus("asdfw")
//            }
            .flatMap {
                Mono.just(it.plus("1"))
            }
            .or(Mono.just("空白"))
//            .onErrorReturn("错误")
            .subscribe({
                println(it)
            }, { println(it.message) })
    }

    private fun alphabet(letterNumber: Int): String? {
        if (letterNumber < 1 || letterNumber > 26) {
            return null
        }
        val letterIndexAscii = 'A'.code + letterNumber - 1
        return "" + letterIndexAscii.toChar()
    }

    @Test
    fun test2() {
        val mapTable = ArrayList<Char>(10 + 26 + 26)
        for (i in '0'..'9') {
            mapTable.add(i)
        }
        for (i in 'a'..'z') {
            mapTable.add(i)
        }
        for (i in 'A'..'Z') {
            mapTable.add(i)
        }
        mapTable.forEach {
            println(it)
        }
    }
}