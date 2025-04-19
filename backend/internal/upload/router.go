package upload

import "net/http"

func RegisterHandlers(mux *http.ServeMux) {
    mux.HandleFunc("POST /upload", UploadHandler)
}