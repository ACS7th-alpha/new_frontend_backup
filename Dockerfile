# Install dependencies only when needed
FROM node:18-alpine AS deps

# 필요한 패키지만 설치
RUN apk add --no-cache libc6-compat

WORKDIR /app

# package.json 최적화를 위한 복사
COPY package.json package-lock.json ./
# 프로덕션 빌드에 필요한 의존성만 설치
RUN npm ci --only=production --no-audit --no-optional

# Rebuild the source code only when needed
FROM node:18-alpine AS builder

# 필수 패키지만 설치
RUN apk add --no-cache libc6-compat

WORKDIR /app

# 의존성 파일만 먼저 복사하여 캐시 활용
COPY package.json package-lock.json ./

# 빌드에 필요한 모든 의존성 설치 (critters 포함)
RUN npm ci && npm install critters

# 소스 파일 복사
COPY . .

# 프로덕션 빌드
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# 빌드 실행
RUN npm run build

# 프로덕션 의존성만 재설치
RUN rm -rf node_modules && \
    npm ci --only=production --no-audit --no-optional && \
    npm cache clean --force

# 프로덕션 이미지
FROM node:18-alpine AS runner

# 최소한의 런타임 환경 설정
RUN apk add --no-cache libc6-compat \
    && addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 nextjs \
    && mkdir -p /app \
    && chown -R nextjs:nodejs /app

WORKDIR /app

# 환경 변수 설정
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# 필요한 파일만 선택적으로 복사
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nextjs:nodejs /app/package.json ./package.json

# 보안을 위한 사용자 전환
USER nextjs

# 포트 노출
EXPOSE 3000

# 헬스체크 추가
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# 캐시 최적화
RUN npm cache clean --force

# Next.js 실행
CMD ["npm", "start"]