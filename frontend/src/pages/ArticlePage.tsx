import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../api/axios";
import ReactMarkdown from "react-markdown";
import { Alert, Box, CircularProgress, Container, Typography } from "@mui/material";

interface Article {
  title: string;
  content: string;
  image?: string;
  created_at?: string;
  author_name?: string;
}

export default function ArticlePage() {
  const { id } = useParams();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log("🔍 ArticlePage - id:", id);

  useEffect(() => {
    console.log("🔄 ArticlePage useEffect - fetching article with id:", id);
    
    const fetchArticle = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("📤 Fetching article...");
        const res = await API.get("/articles/" + id);
        console.log("📥 Article data:", res.data);
        setArticle(res.data);
      } catch (err: any) {
        console.error("❌ Error cargando artículo:", err);
        setError(err?.response?.data || "Error al cargar el artículo");
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress size={40} />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      </Container>
    );
  }

  if (!article) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="info">No se encontró el artículo</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {article.image && (
        <Box mb={4}>
          <img
            src={article.image}
            alt="Portada"
            style={{ width: "100%", maxHeight: "400px", objectFit: "cover", borderRadius: "16px" }}
          />
        </Box>
      )}
      <Typography variant="h2" component="h1" gutterBottom fontWeight={700}>
        {article.title}
      </Typography>
      <Box mb={4} display="flex" gap={2} alignItems="center">
        {article.author_name && (
          <Typography variant="subtitle1" color="text.secondary">
            Por {article.author_name}
          </Typography>
        )}
        {article.created_at && (
          <Typography variant="subtitle1" color="text.secondary">
            • {new Date(article.created_at).toLocaleDateString()}
          </Typography>
        )}
      </Box>
      <Box sx={{ typography: "body1", fontSize: "1.125rem", lineHeight: 1.8 }}>
        <ReactMarkdown>{article.content}</ReactMarkdown>
      </Box>
    </Container>
  );
}