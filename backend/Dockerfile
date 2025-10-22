FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS base
WORKDIR /app
EXPOSE 5000

FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src
COPY ["TaskForU.Api.csproj", "."]
RUN dotnet restore "./TaskForU.Api.csproj"
COPY . .
WORKDIR "/src/."
RUN dotnet build "TaskForU.Api.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "TaskForU.Api.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .

# Set environment variables
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Development

ENTRYPOINT ["dotnet", "TaskForU.Api.dll"]