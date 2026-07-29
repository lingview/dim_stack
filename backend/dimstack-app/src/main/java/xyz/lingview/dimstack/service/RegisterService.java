package xyz.lingview.dimstack.service;

import xyz.lingview.dimstack.dto.request.RegisterDTO;
import xyz.lingview.dimstack.dto.response.RegisterResponseDTO;

public interface RegisterService {
    RegisterResponseDTO register(RegisterDTO requestDTO);
}