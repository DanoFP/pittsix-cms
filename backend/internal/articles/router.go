package articles

import (
	"net/http"
	"pittsix/pkg/middleware"
)

func RegisterHandlers(mux *http.ServeMux) {
	mux.HandleFunc("GET /articles", ListArticlesHandler)
	mux.HandleFunc("GET /articles/{id}", GetArticleByIDHandler)
	mux.Handle("POST /articles", middleware.JWTAuth(http.HandlerFunc(CreateArticleHandler)))
	mux.Handle("GET /my-articles", middleware.JWTAuth(http.HandlerFunc(GetMyArticlesHandler)))
	mux.Handle("PUT /articles/{id}", middleware.JWTAuth(http.HandlerFunc(UpdateArticleHandler)))
	mux.Handle("DELETE /articles/{id}", middleware.JWTAuth(http.HandlerFunc(DeleteArticleHandler)))
}
