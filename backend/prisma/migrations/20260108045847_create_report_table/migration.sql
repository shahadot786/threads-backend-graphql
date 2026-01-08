-- CreateTable
CREATE TABLE "reposts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reposts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reports" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "attachment_url" TEXT,
    "device_info" JSONB,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "user_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reports_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "reposts_post_id_idx" ON "reposts"("post_id");

-- CreateIndex
CREATE UNIQUE INDEX "reposts_user_id_post_id_key" ON "reposts"("user_id", "post_id");

-- CreateIndex
CREATE INDEX "reports_user_id_idx" ON "reports"("user_id");

-- AddForeignKey
ALTER TABLE "reposts" ADD CONSTRAINT "reposts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reposts" ADD CONSTRAINT "reposts_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reports" ADD CONSTRAINT "reports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
