package com.potato.cloud.model

import com.fasterxml.jackson.annotation.JsonValue

enum class FileType(@JsonValue val value: Int) {

    DIR(0), // 文件夹
    FILE(1),// 文件
}

data class FileInfo(
    val name: String,
    // 0：文件夹 1：文件
    val type: FileType,
    val modificationTime: Long,
    val size: Long,
    val path: String,
    val url: String,
)
