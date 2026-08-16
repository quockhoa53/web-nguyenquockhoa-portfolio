export const knowledgeGroups = [
  { name: 'Java & Spring Boot', articles: [
    { slug: 'clean-architecture-spring-boot', title: 'Clean Architecture trong Spring Boot', summary: 'Tổ chức domain, application và infrastructure để code dễ kiểm thử, dễ mở rộng.', tags: ['Java', 'Spring Boot', 'Architecture'] },
    { slug: 'rest-api-best-practices', title: 'Thiết kế REST API thực tế', summary: 'Quy ước endpoint, validation, error response và versioning cho API production.', tags: ['REST', 'API', 'Backend'] },
  ]},
  { name: 'Database & Data', articles: [
    { slug: 'postgresql-index', title: 'Tối ưu PostgreSQL bằng Index', summary: 'Cách đọc execution plan và chọn index phù hợp với truy vấn.', tags: ['PostgreSQL', 'SQL'] },
    { slug: 'cdc-data-pipeline', title: 'CDC và Data Pipeline', summary: 'Luồng đồng bộ dữ liệu gần realtime với retry và quan sát lỗi.', tags: ['CDC', 'Apache Flink', 'Data'] },
  ]},
  { name: 'DevOps & Engineering', articles: [
    { slug: 'docker-backend', title: 'Đóng gói backend với Docker', summary: 'Xây dựng image nhỏ, cấu hình môi trường và health check.', tags: ['Docker', 'CI/CD'] },
  ]},
]

export const workItems = [
  { slug:'backend-architecture', period:'2024 — Hiện tại', role:'Backend Developer', company:'Software Team', title:'Backend & thiết kế hệ thống', summary:'Phân tích nghiệp vụ, thiết kế REST API và triển khai module backend theo Clean Architecture.', icon:'</>', technologies:['Java','Spring Boot','Gradle','REST API','PostgreSQL'], highlights:['Thiết kế API contract rõ ràng giữa backend và frontend.','Tổ chức code theo domain, application và infrastructure.','Validation đầu vào và chuẩn hóa error response.','Review code, tối ưu truy vấn và xử lý lỗi production.'] },
  { slug:'data-processing', period:'2024 — 2025', role:'Junior Developer', company:'Data Platform', title:'Xử lý dữ liệu & CDC', summary:'Xây dựng luồng xử lý dữ liệu, mapping sự kiện và cơ chế retry có kiểm soát.', icon:'↗', technologies:['Apache Flink','CDC','PostgreSQL','Kafka','Java'], highlights:['Xử lý event theo luồng và đảm bảo dữ liệu nhất quán.','Thiết kế mapping linh hoạt giữa payload và database.','Theo dõi lỗi, retry và hỗ trợ vận hành pipeline.'] },
  { slug:'ai-integration', period:'2025 — Hiện tại', role:'Backend Developer', company:'AI Project', title:'Tích hợp AI Agent', summary:'Kết nối mô hình AI vào quy trình nghiệp vụ và xây dựng công cụ hỗ trợ đội ngũ.', icon:'✦', technologies:['AI Agent','LLM API','Prompt Engineering','Spring Boot'], highlights:['Thiết kế luồng gọi AI an toàn và có fallback.','Chuẩn hóa prompt, input và structured output.','Đánh giá chất lượng kết quả theo tình huống thực tế.'] },
]

export const allArticles = knowledgeGroups.flatMap((group) => group.articles)
