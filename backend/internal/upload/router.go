package upload

import "net/http"

func RegisterHandlers(mux *http.ServeMux, h *Handler) {
	mux.HandleFunc("POST /upload", h.UploadHandler)
	mux.HandleFunc("POST /upload/profile-image", h.UploadProfileImageHandler)
}
