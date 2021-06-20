package com.potato.cloud.controller

import com.potato.cloud.annotations.PassAuth
import com.potato.cloud.model.FileInfo
import com.potato.cloud.model.FileType
import com.potato.cloud.model.ResponseWrap
import com.potato.cloud.properties.ConfigProperties
import org.slf4j.LoggerFactory
import org.springframework.http.MediaType
import org.springframework.http.ZeroCopyHttpOutputMessage
import org.springframework.http.codec.multipart.FilePart
import org.springframework.http.server.reactive.ServerHttpRequest
import org.springframework.http.server.reactive.ServerHttpResponse
import org.springframework.ui.Model
import org.springframework.util.FileSystemUtils
import org.springframework.web.bind.annotation.*
import reactor.core.publisher.Mono
import java.io.File
import java.io.IOException
import java.net.URLDecoder
import java.nio.file.Files
import java.util.*
import kotlin.io.path.deleteIfExists
import kotlin.io.path.exists


@RestController
class FileController(config: ConfigProperties) {
    private val logger = LoggerFactory.getLogger(this.javaClass)
    private val BASE_PATH = config.filePath

    @PassAuth
    @GetMapping(value = ["/files/**"])
    fun getFiles(model: Model, request: ServerHttpRequest): Mono<ResponseWrap<MutableList<FileInfo>>> {
        return Mono.create<String> {
            it.success(URLDecoder.decode(request.path.value(), "utf-8").removePrefix("/files").removePrefix("/"))
        }.flatMap { path ->
            val resp: ResponseWrap<MutableList<FileInfo>> = ResponseWrap()
            val realPath = if (path.isBlank()) BASE_PATH else BASE_PATH + File.separator + path
            val dir = File(realPath)
            if (!dir.exists() || !dir.isDirectory) {
                resp.status = 1
                resp.msg = "参数错误!"
                return@flatMap Mono.just(resp)
            }
            val rootPath = dir.invariantSeparatorsPath.removePrefix(BASE_PATH.replace("\\", "/")).removePrefix("/")

            val fileList: MutableList<FileInfo> = LinkedList()
            dir.list()?.let { list ->
                for (name in list) {
                    val f = File(dir, name)
                    val relativePath = if (rootPath.isBlank()) name else "$rootPath/$name"
                    fileList.add(
                        FileInfo(
                            name,
                            if (f.isDirectory) FileType.DIR else FileType.FILE,
                            f.lastModified() / 1000,
                            f.length(),
                            relativePath,
                            (if (f.isFile) "/download/" else "/files/") + relativePath
                        )
                    )
                }
                resp.status = 0
                resp.data = fileList
            }
            return@flatMap Mono.just(resp)
        }

    }

    @PassAuth
    @GetMapping(value = ["/download/**"])
    fun download(request: ServerHttpRequest, response: ServerHttpResponse): Mono<Void> {
        return Mono.create<String> {
            it.success(
                URLDecoder.decode(request.path.value(), "utf-8")
                    .removePrefix("/download")
                    .removePrefix("/")
            )
        }.flatMap { path ->
            try {

                val file = File("$BASE_PATH/$path")
                if (!file.exists()) {
                    response.rawStatusCode = 404
                    logger.info(file.absolutePath + " 不存在")
                    return@flatMap response.writeAndFlushWith(Mono.empty())
                }
                val zeroCopyResponse = response as ZeroCopyHttpOutputMessage
                response.getHeaders().contentLength = file.length()
                return@flatMap zeroCopyResponse.writeWith(file, 0, file.length())
            } catch (e: IOException) {
                logger.error(e.message, e)
            }
            return@flatMap response.writeAndFlushWith(Mono.empty())
        }

    }

    @PostMapping("/upload/create-dir")
    fun createDir(
        @RequestBody body: Mono<Map<String, String?>>
    ): Mono<ResponseWrap<Boolean>> {
        return body.flatMap { json ->
            val path = json["path"] ?: ""
            val name = json["name"] ?: ""
            if (name.isEmpty()) {
                return@flatMap Mono.just(ResponseWrap.error("参数错误", false))
            }
            val dir = File(if (path.trim() == "/") "$BASE_PATH/$name" else "$BASE_PATH/$path/$name")
            return@flatMap if (dir.exists()) {
                Mono.just(ResponseWrap.error("${name}文件夹已存在", false))
            } else {
                if (dir.mkdir()) {
                    Mono.just(ResponseWrap.success(true))
                } else {
                    Mono.just(ResponseWrap.error("创建${name}文件夹失败", false))
                }
            }
        }

    }

    @PostMapping(value = ["/upload/file"], consumes = [MediaType.MULTIPART_FORM_DATA_VALUE])
    fun handleFileUpload(
        @RequestPart("file") filePart: FilePart,
        @RequestPart(value = "path", required = false) path: String?,
    ): Mono<ResponseWrap<Any>> {
        val name = filePart.filename()
        val file = File(
            if (path.isNullOrBlank()) "$BASE_PATH/$name" else "$BASE_PATH/$path/$name"
        ).toPath()
        return filePart.transferTo(file).flatMap {
            return@flatMap Mono.just(ResponseWrap.success(null, "上传成功"))
        }
    }

    @GetMapping(value = ["/delete/file"])
    fun deleteFile(
        @RequestParam("path") path: String?,
    ): Mono<ResponseWrap<Boolean>> {
        val file = File("$BASE_PATH/$path").toPath()
        return if (file.exists()) {
            Mono.create<Boolean> { it.success(FileSystemUtils.deleteRecursively(file)) }.map {
                ResponseWrap.success(it)
            }
        } else {
            Mono.just(ResponseWrap.error("文件不存在"))
        }
    }
}