# Usa uma imagem Nginx otimizada para servir arquivos estáticos
FROM nginx:alpine

# Remove o arquivo de configuração padrão do Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copia o seu arquivo de configuração Nginx personalizado
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copia os arquivos do seu front-end para o diretório de serviço do Nginx
COPY . /usr/share/nginx/html

# Expõe a porta 80 (padrão HTTP do Nginx)
EXPOSE 80

# Comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]