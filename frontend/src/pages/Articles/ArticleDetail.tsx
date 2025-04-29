import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Container, Typography, Box, CircularProgress, Alert, Avatar, Chip, Tooltip } from '@mui/material';
import API from '../../api/axios';
import { Helmet } from 'react-helmet-async';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import FacebookIcon from '@mui/icons-material/Facebook';
import IconButton from '@mui/material/IconButton';

export default function PublicArticleDetail() {
    const { id } = useParams();  const [article, setArticle] = useState<any>(null);  const [loading, setLoading] = useState(true);  const [error, setError] = useState('');  console.log("🔍 PublicArticleDetail - id:", id);  useEffect(() => {    if (!id) return;    console.log("🔄 PublicArticleDetail useEffect - fetching article with id:", id);    setLoading(true);    API.get(`/articles/${id}`)      .then(res => {        console.log("📥 Article data:", res.data);        setArticle(res.data);      })      .catch((err) => {        console.error("❌ Error cargando artículo:", err);        setError('No se encontró el artículo');      })      .finally(() => setLoading(false));
      }, [id]);

  if (loading) return <Box display="flex" justifyContent="center" mt={6}><CircularProgress /></Box>;
  if (error) return <Alert severity="error" sx={{ mt: 4 }}>{error}</Alert>;
  if (!article) return null;

  const shareUrl = `${window.location.origin}/article/${article._id}`;
  const shareText = encodeURIComponent(article.title);
  const imageUrl = article.image || 'https://yourcompany.com/default-og-image.jpg'; // Cambia por tu imagen por defecto
  const authorName = article.author_name || article.author || '-';

  return (
    <>
      <Helmet>
        <title>{article.title} | TuEmpresa</title>
        <meta name="description" content={article.content?.slice(0, 160) || 'Artículo de TuEmpresa'} />
        <meta property="og:title" content={article.title} />
        <meta property="og:description" content={article.content?.slice(0, 160) || ''} />
        <meta property="og:image" content={imageUrl} />
        <meta property="og:url" content={shareUrl} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={article.title} />
        <meta name="twitter:description" content={article.content?.slice(0, 160) || ''} />
        <meta name="twitter:image" content={imageUrl} />
      </Helmet>
      {/* Hero visual */}
      <Box
        sx={{
          position: 'relative',
          width: '100%',
          height: { xs: 220, md: 340 },
          mb: 3,
          borderRadius: 4,
          overflow: 'hidden',
          boxShadow: 3,
          backgroundColor: '#e0e7ef',
        }}
      >
        {article.image && (
          <Box
            component="img"
            src={imageUrl}
            alt={article.title}
            sx={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              position: 'absolute',
              top: 0,
              left: 0,
              zIndex: 1,
            }}
          />
        )}
        {/* Overlay */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            bgcolor: 'rgba(0,0,0,0.45)',
            zIndex: 2,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: 'white',
            textAlign: 'center',
            px: 2,
          }}
        >
          <Typography variant="h2" fontWeight={800} sx={{ mb: 2, fontSize: { xs: 28, md: 40 } }}>
            {article.title}
          </Typography>
          <Box display="flex" gap={2} alignItems="center" justifyContent="center" mb={1}>
            <Chip label={article.status === 'published' ? 'Publicado' : 'Borrador'} color={article.status === 'published' ? 'success' : 'default'} sx={{ fontWeight: 700 }} />
            <Typography variant="body1" sx={{ color: 'white', opacity: 0.85 }}>
              {article.created_at ? new Date(article.created_at).toLocaleDateString() : ''}
            </Typography>
          </Box>
        </Box>
      </Box>
      {/* Botones de compartir */}
      <Box display="flex" gap={2} mb={3} justifyContent="center">
        <Tooltip title="Compartir en LinkedIn">
          <IconButton
            component="a"
            href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener"
            sx={{ bgcolor: '#0077b5', color: 'white', '&:hover': { bgcolor: '#005983' }, width: 56, height: 56 }}
          >
            <LinkedInIcon fontSize="large" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Compartir en Twitter">
          <IconButton
            component="a"
            href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${shareText}`}
            target="_blank"
            rel="noopener"
            sx={{ bgcolor: '#1da1f2', color: 'white', '&:hover': { bgcolor: '#0d8ddb' }, width: 56, height: 56 }}
          >
            <TwitterIcon fontSize="large" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Compartir en Facebook">
          <IconButton
            component="a"
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
            target="_blank"
            rel="noopener"
            sx={{ bgcolor: '#4267B2', color: 'white', '&:hover': { bgcolor: '#314d86' }, width: 56, height: 56 }}
          >
            <FacebookIcon fontSize="large" />
          </IconButton>
        </Tooltip>
      </Box>
      {/* Autor y contenido */}
      <Container maxWidth="md" sx={{ py: 2 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <Avatar src={article.author_avatar || undefined} alt={authorName} sx={{ width: 64, height: 64, fontSize: 32, bgcolor: 'primary.main' }}>
            {authorName[0]}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>{authorName}</Typography>
            {/* Aquí podrías agregar bio del autor si está disponible */}
          </Box>
        </Box>
        <Box mt={2} mb={4} sx={{ background: 'white', borderRadius: 3, boxShadow: 2, p: { xs: 2, md: 4 } }}>
          <Typography variant="body1" sx={{ whiteSpace: 'pre-line', fontSize: 20, lineHeight: 1.7 }}>
            {article.content}
          </Typography>
        </Box>
      </Container>
    </>
  );
} 