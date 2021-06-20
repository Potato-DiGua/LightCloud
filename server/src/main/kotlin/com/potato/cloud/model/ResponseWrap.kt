package com.potato.cloud.model

class ResponseWrap<T> {
    // 0 表示成功 1表示失败
    var status: Int = 1

    // 提示
    var msg: String? = null

    // 数据
    var data: T? = null

    companion object {
        fun <T> create(success: Boolean, msg: String?, data: T?): ResponseWrap<T> {
            val resp = ResponseWrap<T>()
            resp.apply {
                status = if (success) 0 else 1
                this.msg = msg
                this.data = data
            }
            return resp
        }

        fun <T> error(msg: String, data: T? = null): ResponseWrap<T> {
            return create(false, msg, data)
        }

        fun <T> success(data: T?, msg: String? = null): ResponseWrap<T> {
            return create(true, msg, data)
        }
    }


}