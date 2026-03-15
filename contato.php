<?php
if ($_SERVER['REQUEST_METHOD'] == 'POST') {
    $nome = $_POST['nome'] ?? '';
    $email = $_POST['email'] ?? '';
    $telefone = $_POST['telefone'] ?? '';
    $assunto = $_POST['assunto'] ?? '';
    $mensagem = $_POST['mensagem'] ?? '';
    
    if ($nome && $email && $mensagem) {
        $to = 'contato@florabelle.com.br';
        $subject = "Novo contato - Flora Belle - $assunto";
        $body = "
        Novo contato recebido:\n\n
        Nome: $nome\n
        Email: $email\n
        Telefone: $telefone\n
        Assunto: $assunto\n
        Mensagem: $mensagem\n
        ";
        
        $headers = "From: $email\r\n";
        $headers .= "Reply-To: $email\r\n";
        
        if (mail($to, $subject, $body, $headers)) {
            echo json_encode(['success' => true, 'message' => 'Mensagem enviada com sucesso!']);
        } else {
            echo json_encode(['success' => false, 'message' => 'Erro ao enviar mensagem. Tente novamente.']);
        }
    } else {
        echo json_encode(['success' => false, 'message' => 'Preencha todos os campos obrigatórios.']);
    }
}
?>
