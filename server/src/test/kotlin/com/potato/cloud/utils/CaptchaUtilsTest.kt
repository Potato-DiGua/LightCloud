package com.potato.cloud.utils

import org.junit.jupiter.api.Test
import java.io.File
import javax.imageio.ImageIO

internal class CaptchaUtilsTest {

    @Test
    fun getImageCode() {
        val captcha = CaptchaUtils.getImageCode(75, 25)
        println(captcha.first)
        ImageIO.write(captcha.second, "png", File("test1.png"))
    }
}