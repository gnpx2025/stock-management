# syntax=docker/dockerfile:1

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY Directory.Build.props ./
COPY global.json ./
COPY ERP.sln ./
COPY src/ERP.Domain/ERP.Domain.csproj src/ERP.Domain/
COPY src/ERP.Application/ERP.Application.csproj src/ERP.Application/
COPY src/ERP.Infrastructure/ERP.Infrastructure.csproj src/ERP.Infrastructure/
COPY src/ERP.Api/ERP.Api.csproj src/ERP.Api/

RUN dotnet restore src/ERP.Api/ERP.Api.csproj

COPY src/ ./src/
RUN dotnet publish src/ERP.Api/ERP.Api.csproj -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final
WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

ENV ASPNETCORE_URLS=http://+:8080
# Production loads appsettings.Production.json (CORS + cross-site cookies).
# Local Compose overrides this with ASPNETCORE_ENVIRONMENT=Development.
ENV ASPNETCORE_ENVIRONMENT=Production

COPY --from=build /app/publish .

EXPOSE 8080
ENTRYPOINT ["dotnet", "ERP.Api.dll"]
