package com.potato.cloud.utils

import org.springframework.core.io.ClassPathResource
import java.awt.Color
import java.awt.Font
import java.awt.image.BufferedImage
import java.util.*
import kotlin.collections.ArrayList


object CaptchaUtils {
    private val mapTable: MutableList<Char>

    // 验证码长度
    private const val LENGTH = 4

    // 干扰线数量
    private const val LINE_COUNT = 50
    private val font: Font

    init {
        mapTable = ArrayList(10 + 26 + 26)
        for (i in '0'..'9') {
            mapTable.add(i)
        }
        for (i in 'a'..'z') {
            mapTable.add(i)
        }
        for (i in 'A'..'Z') {
            mapTable.add(i)
        }

        font = ClassPathResource("fonts/times.ttf").inputStream.use {
            Font.createFont(Font.TRUETYPE_FONT, it).deriveFont(18f) ?: throw Exception("加载字体文件失败")
        }

    }

    fun getImageCode(width: Int, height: Int): Pair<String, BufferedImage> {
        val image = BufferedImage(width, height, BufferedImage.TYPE_INT_RGB)
        // 获取图形上下文
        val g = image.graphics
        //生成随机类
        val random = Random()
        // 设定背景色
        g.color = getRandColor(200, 250)
        g.fillRect(0, 0, width, height)
        g.font = font

        // 随机产生干扰线，使图象中的认证码不易被其它程序探测到
        for (i in 0 until LINE_COUNT) {
            g.color = getRandColor(160, 200)
            val x: Int = random.nextInt(width)
            val y: Int = random.nextInt(height)
            val x2: Int = random.nextInt(width)
            val y2: Int = random.nextInt(height)
            g.drawLine(x, y, x2, y2)
        }
        //取随机产生的码
        val strEnsure = StringBuilder()
        val charWidth = width / LENGTH
        //4代表4位验证码,如果要生成更多位的认证码,则加大数值
        for (i in 0 until LENGTH) {

            val char = mapTable[(mapTable.size * random.nextFloat()).toInt()]
            strEnsure.append(char)
            // 将认证码显示到图象中
            g.color = Color(20 + random.nextInt(110), 20 + random.nextInt(110), 20 + random.nextInt(110))
            g.font = font.deriveFont(20f + random.nextFloat() * 10f)
            // 直接生成
            g.drawString(
                char.toString(),
                charWidth * i + random.nextInt(10),
                g.font.size + random.nextInt(6) - 6
            )
        }
        // 释放图形上下文
        g.dispose()
        return Pair(strEnsure.toString(), image)
    }

    //给定范围获得随机颜色
    fun getRandColor(fc: Int, bc: Int): Color {
        var fc = fc
        var bc = bc
        val random = Random()
        if (fc > 255) fc = 255
        if (bc > 255) bc = 255
        val r: Int = fc + random.nextInt(bc - fc)
        val g: Int = fc + random.nextInt(bc - fc)
        val b: Int = fc + random.nextInt(bc - fc)
        return Color(r, g, b)
    }
}